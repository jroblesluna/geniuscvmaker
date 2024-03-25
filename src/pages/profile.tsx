import React from 'react'
import { withProtected } from '../hook/route'

function Profile() {
  return (
    <div>Profile</div>
  )
}

export default withProtected(Profile);