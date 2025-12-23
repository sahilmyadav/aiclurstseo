import { useContext } from "react"
import { useGoogleBusiness } from "../context/GoogleBusinessContext"

const Video = () => {

    const { reviews } = useGoogleBusiness()
    console.log("reviews", reviews)

    return (

        <div className="
        ">



        </div>
    )

}


export default Video