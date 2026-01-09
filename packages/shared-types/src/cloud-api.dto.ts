import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRestaurantDto {
  @ApiProperty({ description: "Restaurant name", example: "My Restaurant" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "Restaurant address",
    example: "123 Main Street",
  })
  @IsString()
  @IsNotEmpty()
  address!: string;
}

export class ActivateRestaurantDto {
  @ApiProperty({
    description: "One-time activation secret received when creating restaurant",
    example: "ABC123XYZ789DEF456",
  })
  @IsString()
  @IsNotEmpty()
  activation_secret!: string;

  @ApiProperty({
    description: "Ed25519 public key in PEM format",
    example: "-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----",
  })
  @IsString()
  @IsNotEmpty()
  public_key!: string;
}

export class CreateRestaurantResponseDto {
  @ApiProperty({ description: "Restaurant ID", example: "clx1234567890" })
  id!: string;

  @ApiProperty({ description: "Restaurant name", example: "My Restaurant" })
  name!: string;

  @ApiProperty({
    description: "Restaurant address",
    example: "123 Main Street",
  })
  address!: string;

  @ApiProperty({
    description: "One-time activation secret (save this - shown only once!)",
    example: "ABC123XYZ789DEF456",
  })
  activation_secret!: string;

  @ApiProperty({
    description: "Important message",
    example:
      "Restaurant created. Save the activation_secret - it will not be shown again.",
  })
  message!: string;
}

export class ActivateRestaurantResponseDto {
  @ApiProperty({
    description: "Unique server identifier",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  server_id!: string;

  @ApiProperty({
    description: "Success message",
    example: "Restaurant activated successfully",
  })
  message!: string;
}
