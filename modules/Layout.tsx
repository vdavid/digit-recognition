import React from 'react'
import Head from 'next/head'

interface Props {
    title: string
    description: string
    children: React.ReactNode
}

const Layout: React.FC<Props> = ({ title, description, children }) => {
    return (
        <>
            <Head>
                <title>{title}</title>
                <meta name="description" content={description} />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="container">{children}</div>
            <style jsx>{`
                .container {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                }
            `}</style>
        </>
    )
}

export default Layout
