// src/locations/entities/location.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export enum LocationType {
  POWER_STATION = 'power_station',
  BLOCK = 'block',
  ROW = 'row',
  INVERSOR = 'inversor',
  SCB = 'scb',
  STRING = 'string',
  SUBSTATION = 'substation',
  BUILDING = 'building',
  PERIMETER_FENCE = 'perimeter_fence',
  SECURITY_BOOTH = 'security_booth',
  LIGHTING_POLE = 'lighting_pole',
  ARBORETUM = 'arboretum',
  WEATHER_STATION = 'weather_station',
  PS_GIRASOL = 'ps_girasol',
}

@Schema({ _id: false })
export class Coordinates {
  @Prop({ type: Number, required: true })
  lat: number;

  @Prop({ type: Number, required: true })
  lng: number;
}
export const CoordinatesSchema = SchemaFactory.createForClass(Coordinates);

@Schema({ timestamps: true })
export class Location {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string;

  @Prop({ required: true, enum: Object.values(LocationType) })
  type: LocationType;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: false,
  })
  parentLocation?: Location;

  @Prop({ required: false, trim: true })
  description?: string;

  @Prop({ type: CoordinatesSchema, required: false })
  coordinates?: Coordinates;
}

export type LocationDocument = HydratedDocument<Location>;
export const LocationSchema = SchemaFactory.createForClass(Location);
