import { IsString, IsIn } from 'class-validator';

export class CreateLoanDto {

  @IsString()
  userId: string;

  @IsString()
  bookId: string;

  @IsString()
  @IsIn(['LAPTOP', 'CHARGER', 'KIT'])
  type: string;

}