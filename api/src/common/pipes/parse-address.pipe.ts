import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { getAddress, isAddress, type Address } from 'viem';

/** Validates and checksums an EVM address from a route param. */
@Injectable()
export class ParseAddressPipe implements PipeTransform<string, Address> {
  transform(value: string): Address {
    if (!isAddress(value)) {
      throw new BadRequestException(`Invalid EVM address: ${value}`);
    }
    return getAddress(value);
  }
}
