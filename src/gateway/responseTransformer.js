export const responseTransformer = {
  transform(response) {
    if (!response || !response.body) {
      return { statusCode: 500, data: { error: 'Internal Server Error' } };
    }
    const data = JSON.parse(JSON.stringify(response.body));
    if (data && typeof data === 'object' && !Array.isArray(data)) {
        delete data.id; 
    }
    return {
      statusCode: response.status,
      data: data
    };
  }
};