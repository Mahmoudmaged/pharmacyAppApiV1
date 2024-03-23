import roleModel from "../../../DB/model/Role.model.js";

// frontend will send {agent: "web" || "mobile"} in headers

const agents = { web: "web", mobile: "mobile" };
const blockedTitlesMobile = ["admin", "superadmin"];

export const checkAgent = async ({ agent, role }) => {
  const roleDetails = await roleModel.findById(role);
  if (
    agent === agents.mobile &&
    blockedTitlesMobile.includes(roleDetails.title)
  )
    return false;

  return true;
};
