import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import {
    Button,
    Card,
    Elevation,
    InputGroup,
    Checkbox,
    Callout,
    Intent
} from "@blueprintjs/core";

import backgroundImage from './pexels-ketut-subiyanto-4560079.png';

const API_URL_LOGIN = process.env.REACT_JSONAPI_URL + "/login";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [forever, setForever] = useState(false);
    const [message, setMessage] = useState();

    const { t } = useTranslation();

    const login = async () => {
        // Fetch emdpoint
        try {
            if (!username.trim().length || !password.trim().length) {
                setMessage("LOGIN_EMPTY");
            }
            else {
                console.log(API_URL_LOGIN, username, password, forever);

                const data = await fetch(API_URL_LOGIN, {
                    method: 'POST',
                    headers: {
                        'Content-Type': "application/vnd.api+json"
                    },
                    body: JSON.stringify({
                        data: {
                            type: "login",
                            id: username,
                            attributes: {
                                password,
                                forever
                            }
                        }
                    })
                });

                console.log(data);
                if (data.status === 401) {
                    console.log("TODO: Unauth");
                    setMessage("LOGIN_UNAUTHORIZED")
                }
                else if (data.status === 403) {
                    console.log("LOGIN_FORBIDDEN");
                }
                else {
                    const { token, user } = await data.json();
                    console.log("DATA => ", token, user);
                }
            }

        }
        catch (e) {
            console.log(e);
        }
    };

    return (
        <section style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundOpacity: 0.5,
            backgroundRepeat: "no-repeat",
            height: "100%"
        }}>
            <article>
                <div style={{
                    bottom: "0.5em",
                    position: "fixed",
                    right: "0.5em"
                }}>
                    <a
                        href='https://www.pexels.com/photo/crop-black-student-with-laptop-and-papers-on-green-lawn-4560079/'
                        target='_blank'
                        style={{ color: "white" }}
                    >
                        {t("PHOTO_BY")} Ketut Subiyanto {t("PHOTO_FROM")} Pexels
                    </a>
                </div>

                <Card
                    interactive={true}
                    elevation={Elevation.TWO}
                    style={{
                        width: "30em",
                        maxWidth: "100%",
                        height: "20em",
                        maxHeight: "100%",
                        margin: 0,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <h5>{t("LOGIN")}</h5>

                    <InputGroup
                        disabled={false}
                        large={true}
                        placeholder={t("USERNAME_OR_EMAIL")}
                        type="text"
                        style={{ margin: "0.5em" }}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <InputGroup
                        disabled={false}
                        large={true}
                        placeholder={t("PASSWORD")}
                        type="password"
                        style={{ margin: "0.5em" }}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <Checkbox
                        checked={forever}
                        label={t("FOREVER")}
                        onChange={e => setForever(e.target.checked)}
                        style={{
                            float: "right"
                        }}
                    />

                    <Button onClick={login} >{t("LOGIN")}</Button>

                    <Callout
                        intent={message ? Intent.DANGER : Intent.PRIMARY}
                        style={{ margin: "0.5em" }}
                    >
                        {t(message || "LOGIN_PRO_TIP")}
                    </Callout>

                </Card>
            </article>
        </section >
    );
}

