package com.hrcompliance.platform.onboarding;

import com.hrcompliance.platform.onboarding.dto.CreateTaskRequest;
import com.hrcompliance.platform.onboarding.dto.DocumentResponse;
import com.hrcompliance.platform.onboarding.dto.TaskResponse;
import com.hrcompliance.platform.security.AuthenticatedUser;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OnboardingService {

    private final OnboardingTaskRepository taskRepository;
    private final DocumentRepository documentRepository;

    private static final String UPLOAD_DIR = "uploads/";

    @Transactional
    public TaskResponse createTask(CreateTaskRequest request) {
        AuthenticatedUser user = getCurrentUser();

        OnboardingTask task = new OnboardingTask();
        task.setCompanyId(user.getCompanyId());
        task.setUserId(request.getUserId());
        task.setTitle(request.getTitle());
        task.setStatus(TaskStatus.PENDING);
        task.setDueDate(request.getDueDate());
        task.setCreatedAt(LocalDateTime.now());
        task = taskRepository.save(task);

        return toTaskResponse(task);
    }

    @Transactional
    public TaskResponse updateTaskStatus(UUID taskId, TaskStatus status) {
        OnboardingTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        task.setStatus(status);
        task = taskRepository.save(task);
        return toTaskResponse(task);
    }

    public List<TaskResponse> getMyTasks() {
        AuthenticatedUser user = getCurrentUser();
        return taskRepository.findByUserId(user.getUserId())
                .stream()
                .map(this::toTaskResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file) throws IOException {
        AuthenticatedUser user = getCurrentUser();

        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Save file with unique name to avoid collisions
        String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        Document document = new Document();
        document.setCompanyId(user.getCompanyId());
        document.setUserId(user.getUserId());
        document.setFileName(file.getOriginalFilename());
        document.setFilePath(filePath.toString());
        document.setUploadedAt(LocalDateTime.now());
        document.setCreatedAt(LocalDateTime.now());
        document = documentRepository.save(document);

        return new DocumentResponse(
                document.getId(),
                document.getUserId(),
                document.getFileName(),
                document.getUploadedAt()
        );
    }

    public List<DocumentResponse> getMyDocuments() {
        AuthenticatedUser user = getCurrentUser();
        return documentRepository.findByUserId(user.getUserId())
                .stream()
                .map(d -> new DocumentResponse(
                        d.getId(),
                        d.getUserId(),
                        d.getFileName(),
                        d.getUploadedAt()
                ))
                .collect(Collectors.toList());
    }

    private TaskResponse toTaskResponse(OnboardingTask task) {
        return new TaskResponse(
                task.getId(),
                task.getUserId(),
                task.getTitle(),
                task.getStatus(),
                task.getDueDate(),
                task.getCreatedAt()
        );
    }

    private AuthenticatedUser getCurrentUser() {
        return (AuthenticatedUser) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();
    }
}