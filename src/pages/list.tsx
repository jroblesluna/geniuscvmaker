import React from 'react'
import { withProtected } from '../hook/route'

function List() {
  return (
    <div>List</div>
  )
}

export default withProtected(List);