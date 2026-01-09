import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetupLocalApiDto {
  @ApiProperty({
    description:
      "Activation secret received from Cloud API when restaurant was created",
    example: "ABC123XYZ789DEF456",
  })
  @IsString()
  @IsNotEmpty()
  activation_secret!: string;
}

export class SetupLocalApiResponseDto {
  @ApiProperty({
    description: "Unique server identifier assigned by Cloud API",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  server_id!: string;

  @ApiProperty({
    description: "Success message",
    example: "Local API activated successfully",
  })
  message!: string;
}

export class CreateTabletDto {
  @ApiProperty({ description: "Tablet name", example: "Tablet 1" })
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class ActivateTabletDto {
  @ApiProperty({
    description:
      "One-time activation code received when creating tablet (expires in 10 minutes)",
    example: "ABC12345",
  })
  @IsString()
  @IsNotEmpty()
  activation_code!: string;

  @ApiProperty({
    description: "Ed25519 public key in PEM format",
    example: "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  })
  @IsString()
  @IsNotEmpty()
  public_key!: string;
}

export class CreateTabletResponseDto {
  @ApiProperty({ description: "Tablet ID", example: "clx1234567890" })
  id!: string;

  @ApiProperty({
    description: "Unique tablet identifier",
    example: "660e8400-e29b-41d4-a716-446655440001",
  })
  tablet_id!: string;

  @ApiProperty({ description: "Tablet name", example: "Tablet 1" })
  name!: string;

  @ApiProperty({
    description: "One-time activation code (expires in 10 minutes)",
    example: "ABC12345",
  })
  activation_code!: string;

  @ApiProperty({
    description: "Activation code expiration time",
    example: "2024-01-01T12:10:00.000Z",
  })
  expires_at!: string;

  @ApiProperty({
    description: "Important message",
    example: "Tablet created. Activation code expires in 10 minutes.",
  })
  message!: string;
}

export class ActivateTabletResponseDto {
  @ApiProperty({
    description: "Unique tablet identifier",
    example: "660e8400-e29b-41d4-a716-446655440001",
  })
  tablet_id!: string;

  @ApiProperty({
    description: "Success message",
    example: "Tablet activated successfully",
  })
  message!: string;
}
