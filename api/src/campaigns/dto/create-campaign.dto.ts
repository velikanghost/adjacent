import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

const CAMPAIGN_TYPES = ['trading', 'lp-incentive', 'quest', 'airdrop'] as const;

export class CreateCampaignDto {
  @ApiProperty({ example: 'Kuru × Perpl Trading Competition' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: ['kuru', 'perpl'], type: [String] })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  protocols: string[];

  @ApiProperty({ enum: CAMPAIGN_TYPES, example: 'trading' })
  @IsIn(CAMPAIGN_TYPES)
  type: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: '$50,000 prize pool' })
  @IsString()
  @IsNotEmpty()
  rewardSummary: string;

  @ApiProperty({ example: '2026-07-15T00:00:00.000Z' })
  @IsISO8601()
  startsAt: string;

  @ApiProperty({ example: '2026-07-31T23:59:59.000Z' })
  @IsISO8601()
  endsAt: string;

  @ApiProperty({ example: 'https://kuru.io/competition' })
  @IsUrl()
  url: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @ApiProperty({ example: 143 })
  @IsInt()
  chainId: number;
}
