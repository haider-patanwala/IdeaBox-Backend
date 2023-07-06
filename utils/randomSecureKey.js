module.exports.randomSecureKey = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return randomString;
};
