import { privileges } from '../../middleware/auth.js'

export const endPoint = {
    approvePharmacy: privileges.approvePharmacy,
    rejectPharmacy: privileges.rejectPharmacy,
}