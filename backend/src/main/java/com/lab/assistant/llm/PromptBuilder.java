package com.lab.assistant.llm;

import com.lab.assistant.labresult.LabResult;
import org.springframework.stereotype.Component;

@Component
public class PromptBuilder {

    public String buildPrompt(LabResult result) {
        String genderText = "M".equals(result.getPatientGender()) ? "Erkek" : "Kadın";
        
        return """
            Sen bir klinik laboratuvar uzmanısın. Aşağıdaki tek bir test sonucunu değerlendir.
            Yanıtını YALNIZCA aşağıdaki JSON formatında ver, başka hiçbir şey yazma:
            
            {
              "clinicalSummary": "...",       // 2-3 cümle, klinik yorum (Türkçe)
              "urgencyLevel": "...",          // ROUTINE | URGENT | CRITICAL
              "suggestedActions": ["..."],    // string array, önerilen klinik adımlar (Türkçe)
              "differentialHints": ["..."],   // olası klinik durumlar (maks 3) (Türkçe)
              "disclaimer": "..."             // sabit uyarı metni (Türkçe)
            }
            
            Test Bilgileri:
            - Test: %s (%s)
            - Sonuç: %s %s
            - Referans Aralığı: %s - %s %s
            - Anormallik Seviyesi: %s
            - Hasta: %s yaşında, %s
            
            Sadece bu tek test için yorum yap. Kesin tanı koyma. Gerekli uyarıları ekle.
            """.formatted(
                result.getTestName(), result.getTestCode(),
                result.getValue(), result.getUnit(),
                result.getReferenceMin(), result.getReferenceMax(), result.getUnit(),
                result.getSeverity(),
                result.getPatientAge() != null ? result.getPatientAge() : "Belirtilmemiş",
                genderText
            );
    }
}
