import { IsString, IsIn } from 'class-validator';

export class CreateLoanDto {

  @IsString()
  userId: string;

  @IsString()
  deviceId: string;    // previously bookId

  @IsString()
  @IsIn(['LAPTOP', 'CHARGER', 'KIT'])
  type: string;

  @IsString()
  startDate: string;  // ISO date string

  @IsString()
  endDate: string;    // ISO date string

}