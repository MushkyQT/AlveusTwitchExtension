// utils
import { useEffect, useState, useRef } from 'react'

//components & hooks
import ActivationButtons from '../activationButtons/ActivationButtons'
import AmbassadorList from '../ambassadorList/AmbassadorList'
import useChatCommand from '../../../../utils/chatCommand'

//css
import styles from './overlay.module.css'

interface OverlayProps {
    sleeping: boolean,
    awoken: {
        add: (callback: () => void) => void,
        remove: (callback: () => void) => void
    }
    wake: (time: number) => void,
    settings: {
        disableChatPopup: boolean
    }
}
export default function Overlay(props: OverlayProps) {
    const [showAmbassadorList, setShowAmbassadorList] = useState(false)
    const chosenAmbassador = useChatCommand()
    const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
    const awakingRef = useRef(false)

    // When a chat command is run, show the list and auto-dismiss it after 6s
    useEffect(() => {
        if (chosenAmbassador !== undefined && !props.settings.disableChatPopup) {
            // Show the list, and dismiss it after 6s
            setShowAmbassadorList(true)
            timeoutRef.current = setTimeout(() => { setShowAmbassadorList(false) }, 6000)

            // Track that we're waking up, so that we don't immediately clear the timeout
            awakingRef.current = true

            // Wake the overlay for 8s
            props.wake(8000)
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [chosenAmbassador, props.wake])

    // If the user interacts with the overlay, clear the auto-dismiss timer
    useEffect(() => {
        const callback = () => {
            if (awakingRef.current) awakingRef.current = false
            else if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
        props.awoken.add(callback)
        return () => props.awoken.remove(callback)
    }, [props.awoken])

    return (
    <div className={`${styles.overlay} ${props.sleeping ? styles.hidden : styles.visible}`} >
        <ActivationButtons
            toggleShowAmbassadorList={() => setShowAmbassadorList(!showAmbassadorList)}
        />
        <AmbassadorList
            showAmbassadorList={showAmbassadorList}
            chatChosenAmbassador={chosenAmbassador?.slice(1)}
        />
    </div>
    )
}
