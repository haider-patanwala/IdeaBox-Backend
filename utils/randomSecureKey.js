module.exports.randomSecureKey = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return randomString;
};

module.exports.developerUID = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return `dev_${randomString}`;
};
module.exports.organizationUID = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return `org_${randomString}`;
};
module.exports.projectUID = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return `proj_${randomString}`;
};
module.exports.proposalUID = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return `prop_${randomString}`;
};
module.exports.reviewUID = () => {
  const length = 8;
  const randomString = Math.floor(Math.random() * 10 ** length);

  return `rev_${randomString}`;
};
