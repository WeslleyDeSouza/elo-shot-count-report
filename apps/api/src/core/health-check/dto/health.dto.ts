import { ApiProperty } from '@nestjs/swagger';

export class HealthStatusDto {
  @ApiProperty({ example: 'ok', description: 'Health status' })
  status: string;

  @ApiProperty({ example: '2024-03-20T10:30:00.000Z', description: 'Timestamp of the check' })
  timestamp: string;
}

export class HealthCheckInfoDto {
  @ApiProperty({ example: 'up', description: 'Status of the service' })
  status: string;

  @ApiProperty({ example: 'Service is responsive', description: 'Additional message', required: false })
  message?: string;
}

export class HealthCheckDetailsDto {
  @ApiProperty({ example: 'up', description: 'Status of the service' })
  status: string;

  @ApiProperty({ example: 12345678, description: 'Used resources', required: false })
  used?: number;

  @ApiProperty({ example: 98765432, description: 'Total resources', required: false })
  total?: number;

  @ApiProperty({ example: 0.125, description: 'Percentage used', required: false })
  percentage?: number;

  @ApiProperty({ example: 'Additional information', description: 'Extra details', required: false })
  message?: string;
}

export class HealthCheckResponseDto {
  @ApiProperty({ example: 'ok', description: 'Overall health status' })
  status: string;

  @ApiProperty({ 
    type: 'object',
    additionalProperties: { type: 'object' },
    description: 'Information about healthy services' 
  })
  info: Record<string, HealthCheckInfoDto>;

  @ApiProperty({ 
    type: 'object',
    additionalProperties: { type: 'object' },
    description: 'Information about unhealthy services' 
  })
  error: Record<string, HealthCheckInfoDto>;

  @ApiProperty({ 
    type: 'object',
    additionalProperties: { type: 'object' },
    description: 'Detailed information about all services' 
  })
  details: Record<string, HealthCheckDetailsDto>;
}