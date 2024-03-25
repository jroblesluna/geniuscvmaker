import React from 'react'
import { withProtected } from '../hook/route'

function Support() {
    return (
        <div>Support</div>
    )
}

export default withProtected(Support);