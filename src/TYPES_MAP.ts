import { GraphQLObjectType, GraphQLType } from 'graphql';
import {
  GraphQLString,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLInt,
  GraphQLID,
} from 'graphql/type/scalars';

export const TYPES_MAP: Map<any, GraphQLType> = new Map();

// GraphQL types
TYPES_MAP.set(GraphQLString, GraphQLString);
TYPES_MAP.set(GraphQLFloat, GraphQLFloat);
TYPES_MAP.set(GraphQLBoolean, GraphQLBoolean);
TYPES_MAP.set(GraphQLInt, GraphQLInt);
TYPES_MAP.set(GraphQLID, GraphQLID);

// JS types
TYPES_MAP.set(String, GraphQLString);
TYPES_MAP.set(Number, GraphQLFloat);
TYPES_MAP.set(Boolean, GraphQLBoolean);

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
  'date',
  'datetime',
  'time',
  'character',
  'varchar',
  'char',
  'tinytext',
  'mediumtext',
  'text',
  'longtext',
];
for (const type of boolTypes) TYPES_MAP.set(type, GraphQLBoolean);
for (const type of floatTypes) TYPES_MAP.set(type, GraphQLFloat);
for (const type of intTypes) TYPES_MAP.set(type, GraphQLInt);
for (const type of stringTypes) TYPES_MAP.set(type, GraphQLString);
