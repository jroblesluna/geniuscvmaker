import React from 'react'
import { withProtected } from '../hook/route'

function Spotlight() {
  return (
    <div>Spotlight</div>
  )
}

export default withProtected(Spotlight)