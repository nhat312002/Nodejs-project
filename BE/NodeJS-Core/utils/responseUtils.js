module.exports = {
  ok: (res, data, message) => {
    return res.status(200).send({
      success: true,
      data,
      status: 200,
      message: message || "ok"
    });
  },

  notFound: (res, message) => {
    return res.status(404).send({
      success: false,
      status: 404,
      message: message || "Cannot find resouces",
    });
  },

  error: (res, message) => {
    return res.status(500).send({
      success: false,
      status: 500,
      message: message || "Internal server error",
    });
  },

  unauthorized: (res, message) => {
    return res.status(401).send({
      success: false,
      status: 401,
      message: message || 'Unauthorized',
    });
  },

  invalidated: (res, errors) => {
    return res.status(422).send({
      success: false,
      status: 422,
      data: errors
    })
  }
};
