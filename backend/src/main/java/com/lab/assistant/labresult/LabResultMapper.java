package com.lab.assistant.labresult;

import com.lab.assistant.labresult.dto.LabResultResponse;
import com.lab.assistant.labresult.dto.LabResultSummaryResponse;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface LabResultMapper {
    LabResultMapper INSTANCE = Mappers.getMapper(LabResultMapper.class);

    LabResultResponse toResponse(LabResult result);
    LabResultSummaryResponse toSummaryResponse(LabResult result);
}
