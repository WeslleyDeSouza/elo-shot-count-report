import 'reflect-metadata';

function getExample(type: string) {
  switch (type) {
    case 'string':
      return 'example text';
    case 'number':
      return 123;
    case 'boolean':
      return true;
    case 'object':
      return {};
    default:
      return null;
  }
}

export function SchemaFromClassGenerator(
  classType: any,
  customProp: any = {},
  metaDataKey: string = 'swagger/apiModelPropertiesArray'
) {
  const schema: any = { type: 'object', properties: { ...customProp } };
  const instance = new classType();
  const keys = Reflect.getMetadata(metaDataKey, instance);

  for (const key of keys) {
    let propKey = key.replace(':', '');
    const metadata = Reflect.getMetadata('design:type', instance, propKey);

    if (!metadata) continue;

    schema.properties[propKey] = {
      type: metadata.name.toLowerCase(),
      example: getExample(metadata.name.toLowerCase()),
    };
  }

  return schema;
}
