//TODO: THE API DOESNT KNOW ABOUT STATUS NOTAPPROVED AND USES IT AS A PENDING
enum LeaveRequestStatus {
  All = "all",
  Pending = "pending",
  Approved = "approved",
  NotApproved = "notapproved",
  Cancelled = "cancelled",
  Rejected = "rejected",
  Expired = "expired",
}
export default LeaveRequestStatus;
