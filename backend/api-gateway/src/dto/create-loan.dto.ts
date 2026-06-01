import { IsString, IsEnum, IsDateString } from 'class-validator';

export class CreateLoanDTO {
  @IsString()
  userId: string;

  @IsString()
  deviceId: string;

  @IsEnum(['LAPTOP', 'CHARGER', 'KIT'], {
    message: 'El tipo debe ser LAPTOP, CHARGER o KIT',
  })
  type: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
