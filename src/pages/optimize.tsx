import React from 'react'
import { withProtected } from '../hook/route'

function Optimize() {
  return (
    <div>Optimize</div>
  )
}

export default withProtected(Optimize)