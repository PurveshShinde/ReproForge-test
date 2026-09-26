export const responseTransformer = {
  transform(response) {
    if (!response || !response.body) {
      return { statusCode: 500, data: { error: 'Internal Server Error' } };
    }
    const data = JSON.parse(JSON.stringify(response.body));
    return {
      statusCode: response.status,
      data: data
    };
  }
};