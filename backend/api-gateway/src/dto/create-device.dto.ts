import { IsString, IsEnum, Length, IsOptional } from 'class-validator';

export class CreateDeviceDTO {
  @IsString()
  @Length(3, 100, { message: 'El nombre debe tener entre 3 y 100 caracteres' })
  name: string;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'LOANED', 'MAINTENANCE'], {
    message: 'El estado debe ser AVAILABLE, LOANED o MAINTENANCE',
  })
  status?: string = 'AVAILABLE';
}

export class UpdateDeviceStatusDTO {
  @IsEnum(['AVAILABLE', 'LOANED', 'MAINTENANCE'], {
    message: 'El estado debe ser AVAILABLE, LOANED o MAINTENANCE',
  })
  status: string;
}
