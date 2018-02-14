import { GraphQLObjectType, GraphQLType } from 'graphql';
import { GraphQLDate, GraphQLTime, GraphQLDateTime } from 'graphql-iso-date';
import {
  ScalarInt,
  ScalarBool,
  ScalarString,
  ScalarDate,
  ScalarTime,
  ScalarDateTime,
  ScalarFloat,
} from './ScalarTypes';
import {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInt,
  GraphQLString,
} from 'graphql/type/scalars';

export const TYPES_MAP: Map<any, GraphQLType> = new Map();

// GraphQL types
TYPES_MAP.set(GraphQLString, GraphQLString);
TYPES_MAP.set(GraphQLFloat, GraphQLFloat);
TYPES_MAP.set(GraphQLBoolean, GraphQLBoolean);
TYPES_MAP.set(GraphQLInt, GraphQLInt);
TYPES_MAP.set(GraphQLID, GraphQLID);

// GraphQL Dates
TYPES_MAP.set(GraphQLDate, GraphQLDate);
TYPES_MAP.set(GraphQLTime, GraphQLTime);
TYPES_MAP.set(GraphQLDateTime, GraphQLDateTime);

// TypeGraph types
TYPES_MAP.set(ScalarInt, GraphQLInt);
TYPES_MAP.set(ScalarFloat, GraphQLFloat);
TYPES_MAP.set(ScalarBool, GraphQLBoolean);
TYPES_MAP.set(ScalarString, GraphQLString);
TYPES_MAP.set(ScalarDate, GraphQLDate);
TYPES_MAP.set(ScalarTime, GraphQLTime);
TYPES_MAP.set(ScalarDateTime, GraphQLDateTime);

// JS types
TYPES_MAP.set(String, GraphQLString);
TYPES_MAP.set(Number, GraphQLFloat);
TYPES_MAP.set(Boolean, GraphQLBoolean);
TYPES_MAP.set(Date, GraphQLDateTime);

// Id types
TYPES_MAP.set('id', GraphQLID);
TYPES_MAP.set('ID', GraphQLID);

// TypeORM types
const boolTypes = ['bool', 'boolean'];

const floatTypes = ['decimal', 'float', 'double', 'real'];

const intTypes = [
  'int',
  'int2',
  'int4',
  'int8',
  'integer',
  'tinyint',
  'smallint',
  'mediumint',
  'bigint',
  'timestamp',
  'year',
];

const stringTypes = [
  'character',
  'varchar',
  'char',
  'tinytext',
  'mediumtext',
  'text',
  'longtext',
  'string',
];

TYPES_MAP.set('datetime', GraphQLDateTime);
TYPES_MAP.set('date', GraphQLDate);
TYPES_MAP.set('time', GraphQLTime);

for (const type of boolTypes) {
  TYPES_MAP.set(type, GraphQLBoolean);
}
for (const type of floatTypes) {
  TYPES_MAP.set(type, GraphQLFloat);
}
for (const type of intTypes) {
  TYPES_MAP.set(type, GraphQLInt);
}
for (const type of stringTypes) {
  TYPES_MAP.set(type, GraphQLString);
}
