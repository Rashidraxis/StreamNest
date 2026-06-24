package com.example.streaming.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.File;
import java.net.URI;

@Service
public class R2StorageService {

    @Value("${r2.access-key}")
    private String accessKey;

    @Value("${r2.secret-key}")
    private String secretKey;

    @Value("${r2.bucket}")
    private String bucket;

    @Value("${r2.endpoint}")
    private String endpoint;

    @Value("${r2.public-url}")
    private String publicUrl;

    private S3Client getClient() {
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)))
                .region(Region.of("auto"))
                .build();
    }

    public void uploadFile(File file, String key, String contentType) {
        S3Client client = getClient();

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(contentType)
                .build();

        client.putObject(request, RequestBody.fromFile(file));
    }

    public void uploadFolder(File folder, String keyPrefix) {
        File[] files = folder.listFiles();
        if (files == null)
            return;

        for (File file : files) {
            String contentType = file.getName().endsWith(".m3u8")
                    ? "application/vnd.apple.mpegurl"
                    : "video/MP2T";

            uploadFile(file, keyPrefix + "/" + file.getName(), contentType);
        }
    }

    public String getPublicUrl(String key) {
        return publicUrl + "/" + key;
    }

    public String uploadThumbnail(File file, String key) {
        uploadFile(file, key, "image/jpeg");
        return getPublicUrl(key);
    }

    public void deleteFile(String key) {
        S3Client client = getClient();
        client.deleteObject(b -> b.bucket(bucket).key(key));
    }

    public void deleteFolder(String keyPrefix) {
        S3Client client = getClient();

        // list all objects with prefix
        var objects = client.listObjects(b -> b.bucket(bucket).prefix(keyPrefix));

        // delete each one
        objects.contents().forEach(obj -> {
            client.deleteObject(b -> b.bucket(bucket).key(obj.key()));
        });
    }
}