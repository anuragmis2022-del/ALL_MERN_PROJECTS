import React from 'react'
import { useSelector } from "react-redux"
import OwnerDashboard from '../Comp/Dashboard/OwnerDashboard'
import AdminDashboard from '../Comp/Dashboard/AdminDashborad'

function Dashboard() {

  const user = useSelector(store => store.user)

  console.log(user)

  if(user?.role=="owner")
  {
    return <OwnerDashboard/>
  }
  else if(user?.role=="admin")
  {
    return <AdminDashboard/>
  }
  return null
}

export default Dashboard