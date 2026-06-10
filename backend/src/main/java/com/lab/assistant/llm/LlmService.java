package com.lab.assistant.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.lab.assistant.labresult.LabResult;
import com.lab.assistant.labresult.LabResultRepository;
import com.lab.assistant.labresult.LabResultService.ResourceNotFoundException;
import com.lab.assistant.llm.dto.LlmAnalysisResponse;
import com.lab.assistant.logging.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LlmService {

    private final LabResultRepository repository;
    private final PromptBuilder promptBuilder;
    private final OllamaClient ollamaClient;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    @Transactional
    public LlmAnalysisResponse analyzeResult(Long id) {
        log.info("Requesting LLM analysis for result ID: {}", id);
        
        LabResult result = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with ID: " + id));

        auditLogService.log("REQUEST_LLM", "LabResult", String.valueOf(result.getId()), 
                "Requested AI interpretation for test: " + result.getTestCode() + ", patient: " + result.getPatientRef());

        String prompt = promptBuilder.buildPrompt(result);
        
        try {
            String rawJson = ollamaClient.generate(prompt);
            log.info("Received raw response from Ollama: {}", rawJson);
            
            // Parse JSON response
            JsonNode root = objectMapper.readTree(rawJson);
            
            String clinicalSummary = root.has("clinicalSummary") ? root.get("clinicalSummary").asText() : "";
            String urgencyLevel = root.has("urgencyLevel") ? root.get("urgencyLevel").asText() : "ROUTINE";
            
            List<String> suggestedActions = new ArrayList<>();
            if (root.has("suggestedActions") && root.get("suggestedActions").isArray()) {
                for (JsonNode node : root.get("suggestedActions")) {
                    suggestedActions.add(node.asText());
                }
            }
            
            List<String> differentialHints = new ArrayList<>();
            if (root.has("differentialHints") && root.get("differentialHints").isArray()) {
                for (JsonNode node : root.get("differentialHints")) {
                    differentialHints.add(node.asText());
                }
            }
            
            String disclaimer = root.has("disclaimer") ? root.get("disclaimer").asText() : 
                    "Bu analiz yapay zeka asistanı tarafından üretilmiştir ve tıbbi tavsiye niteliği taşımaz.";

            return new LlmAnalysisResponse(
                    clinicalSummary,
                    urgencyLevel,
                    suggestedActions,
                    differentialHints,
                    disclaimer,
                    true,
                    rawJson
            );

        } catch (Exception e) {
            log.warn("Failed to obtain AI analysis from Ollama (triggering local fallback): {}", e.getMessage());
            return generateFallbackResponse(result);
        }
    }

    private LlmAnalysisResponse generateFallbackResponse(LabResult result) {
        String severity = result.getSeverity() != null ? result.getSeverity() : "NORMAL";
        String testName = result.getTestName() != null ? result.getTestName() : result.getTestCode();
        Double value = result.getValue();
        String unit = result.getUnit() != null ? result.getUnit() : "";

        String clinicalSummary;
        String urgencyLevel;
        List<String> suggestedActions = new ArrayList<>();
        List<String> differentialHints = new ArrayList<>();
        
        String disclaimer = "ÖNEMLİ UYARI: YZ Servisi şu anda çevrimdışı. Bu rapor, hastane bilgi sistemi kurallarına göre üretilmiş otomatik bir klinik uyarıdır. Kesin karar hekim tarafından verilmelidir.";

        if ("CRITICAL_HIGH".equals(severity) || "CRITICAL_LOW".equals(severity)) {
            urgencyLevel = "CRITICAL";
            clinicalSummary = String.format("DİKKAT: %s değeri %s %s olarak kritik seviyede ölçülmüştür. Bu durum hayati tehlike oluşturabilecek akut bir klinik duruma işaret edebilir.",
                    testName, value, unit);
            suggestedActions.add("Hastanın durumunu hemen klinikte değerlendirin.");
            suggestedActions.add("Vital bulguları ve EKG'yi (özellikle potasyum/sodyum anormalliklerinde) kontrol edin.");
            suggestedActions.add("Laboratuvar ile görüşerek numuneyi tekrar doğrulayın.");
            differentialHints.add("Akut organ yetmezliği veya disfonksiyonu");
            differentialHints.add("Kritik elektrolit / metabolik bozukluk");
        } else if ("HIGH".equals(severity)) {
            urgencyLevel = "URGENT";
            clinicalSummary = String.format("%s değeri %s %s ile normal referans aralığının üzerinde tespit edilmiştir. İlgili bulguların klinik seyrinin izlenmesi önerilir.",
                    testName, value, unit);
            suggestedActions.add("Referans aralığı dışındaki bu değeri hastanın şikayetleri ile korele edin.");
            suggestedActions.add("24-48 saat sonra testi tekrarlamayı düşünün.");
            differentialHints.add("Hafif metabolik veya hormonal dengesizlik");
            differentialHints.add("Kompanse organ disfonksiyonu");
        } else if ("LOW".equals(severity)) {
            urgencyLevel = "URGENT";
            clinicalSummary = String.format("%s değeri %s %s ile referans sınırının altındadır. Nedenlerinin klinik öykü ile birlikte araştırılması yararlı olacaktır.",
                    testName, value, unit);
            suggestedActions.add("Eksiklik nedenlerini (nutrisyonel, emilim veya sentez bozukluğu vb.) araştırın.");
            suggestedActions.add("Hastanın diyet ve tedavi geçmişini sorgulayın.");
            differentialHints.add("Nutrisyonel eksiklik");
            differentialHints.add("Subklinik yetmezlik tablosu");
        } else {
            urgencyLevel = "ROUTINE";
            clinicalSummary = String.format("%s sonucu (%s %s) normal referans aralığında (%s - %s) yer almaktadır. Klinik açıdan stabil kabul edilebilir.",
                    testName, value, unit, result.getReferenceMin(), result.getReferenceMax());
            suggestedActions.add("Rutin takibe devam edin.");
            suggestedActions.add("Hastanın genel klinik seyrine göre ek test planlayın.");
            differentialHints.add("Klinik olarak normal/stabil bulgu");
        }

        return new LlmAnalysisResponse(
                clinicalSummary,
                urgencyLevel,
                suggestedActions,
                differentialHints,
                disclaimer,
                false,
                null
        );
    }
}
