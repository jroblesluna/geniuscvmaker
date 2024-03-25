import React from 'react'
import { withProtected } from '../hook/route'

function Buy() {
  return (
    <div>Buy</div>
  )
}

export default withProtected(Buy)