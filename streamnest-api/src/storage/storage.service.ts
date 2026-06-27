import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
} from '@aws-sdk/client-s3';
import { readFileSync } from 'fs';

@Injectable()
export class StorageService {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private configService: ConfigService) {
    this.bucket = this.configService.get<string>('R2_BUCKET')!;
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL')!;

    this.s3 = new S3Client({
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('R2_SECRET_KEY')!,
      },
      region: 'auto',
    });
  }

  async uploadFile(filePath: string, key: string, contentType: string): Promise<string> {
    const fileContent = readFileSync(filePath);

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: fileContent,
      ContentType: contentType,
    }));

    return `${this.publicUrl}/${key}`;
  }

  async uploadFolder(folderPath: string, keyPrefix: string): Promise<void> {
    const { readdirSync } = await import('fs');
    const files = readdirSync(folderPath);

    for (const file of files) {
      const contentType = file.endsWith('.m3u8')
        ? 'application/vnd.apple.mpegurl'
        : 'video/MP2T';

      await this.uploadFile(`${folderPath}/${file}`, `${keyPrefix}/${file}`, contentType);
    }
  }

  async deleteFile(key: string): Promise<void> {
    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }

  async deleteFolder(keyPrefix: string): Promise<void> {
    const response = await this.s3.send(new ListObjectsCommand({
      Bucket: this.bucket,
      Prefix: keyPrefix,
    }));

    if (response.Contents) {
      for (const obj of response.Contents) {
        await this.deleteFile(obj.Key!);
      }
    }
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }
}