package com.lawfirm.dto;
 
import com.lawfirm.entity.Document;
import java.time.LocalDateTime;
 
public class DocumentDto {
 
    private Long id;
    private String title;
    private String description;
    private String fileName;
    private String filePath;
    private String fileType;
    private Long fileSize;
    private String documentType;
    private String status;
    private LocalDateTime uploadedAt;
    private String uploadedByName;
 
    public static DocumentDto fromEntity(Document d) {
        DocumentDto dto = new DocumentDto();
        dto.setId(d.getId());
        dto.setTitle(d.getTitle());
        dto.setDescription(d.getDescription());
        dto.setFileName(d.getFileName());
        dto.setFilePath(d.getFilePath());
        dto.setFileType(d.getFileType());
        dto.setFileSize(d.getFileSize());
        dto.setDocumentType(d.getDocumentType() != null ? d.getDocumentType().name() : null);
        dto.setStatus(d.getStatus() != null ? d.getStatus().name() : null);
        dto.setUploadedAt(d.getUploadedAt());
        if (d.getUploadedByUser() != null) {
            dto.setUploadedByName(
                d.getUploadedByUser().getFirstName() + " " + d.getUploadedByUser().getLastName());
        }
        return dto;
    }
 
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getDocumentType() { return documentType; }
    public void setDocumentType(String documentType) { this.documentType = documentType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(LocalDateTime uploadedAt) { this.uploadedAt = uploadedAt; }
    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
}