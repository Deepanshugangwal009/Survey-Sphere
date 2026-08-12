exports.runValidation = (schema, payload) => {
  const { error, value } = schema.validate(payload);

  return {
    value,
    errors: error ? error.details.map((detail) => detail.message) : []
  };
};
