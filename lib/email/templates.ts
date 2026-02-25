export function companyInviteTemplate({
  companyName,
  role,
  inviteLink,
}: {
  companyName: string;
  role: string;
  inviteLink: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; padding:20px;">
      <h2>You’ve been invited to join ${companyName}</h2>
      <p>Role: <strong>${role}</strong></p>
      <p>Click below to accept the invitation:</p>
      <a href="${inviteLink}" 
         style="display:inline-block;padding:10px 20px;
         background:#2563eb;color:white;text-decoration:none;
         border-radius:6px;">
         Accept Invitation
      </a>
      <p>This invite expires in 48 hours.</p>
    </div>
  `;
}
