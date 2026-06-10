package com.lab.assistant.labresult.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabResultStatsResponse {
    private long totalCount;
    private long abnormalCount;
    private long criticalCount;
}
