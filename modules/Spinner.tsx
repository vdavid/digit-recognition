import React from 'react'
import styles from './Spinner.module.scss'

const Spinner: React.FC = () => {
    return (
        <div>
            <svg className={styles.spinner} viewBox="0 0 50 50" width="50" height="50">
                <circle cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
            </svg>
        </div>
    )
}

export default Spinner
