import { IsString } from 'class-validator';

export class CreateLoanDto {
  @IsString()
  userId: string;

  @IsString()
  deviceId: string;

  @IsString()
  type: string;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}