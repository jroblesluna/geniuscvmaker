import React from 'react'
import { withProtected } from '../hook/route'

function Craft() {
  return (
    <div>Craft</div>
  )
}

export default withProtected(Craft)