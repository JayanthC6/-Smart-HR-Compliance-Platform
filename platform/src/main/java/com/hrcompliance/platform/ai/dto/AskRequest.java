package com.hrcompliance.platform.ai.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class AskRequest {
    private String question;
    private List<Map<String, String>> history;
}
