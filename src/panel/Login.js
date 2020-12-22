import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import { useAuth } from "../db/auth";

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
    const [message, setMessage] = useState({ intent: Intent.PRIMARY, text: "LOGIN_PRO_TIP" });

    const [user, setUser] = useAuth();
    const { t } = useTranslation();

    /*
    const history = useHistory();
    const location = useLocation();
    const { from } = location.state || { from: { pathname: "/" } };
    */

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

                if (data.status === 401) {
                    console.log("TODO: Unauth");
                    setMessage({ intent: Intent.DANGER, text: "LOGIN_UNAUTHORIZED" });
                }
                else if (data.status === 403) {
                    setMessage({ intent: Intent.DANGER, text: "LOGIN_FORBIDDEN" });
                }
                else {
                    const { token, user } = await data.json();
                    console.log("DATA => ", token, user);
                    setMessage({ intent: Intent.SUCCESS, text: "LOGIN_SUCCESS" });

                    setUser({
                        token,
                        forever,
                        ...user
                    });

                    /*console.log(from);
                    history.replace(from);*/
                }
            }

        }
        catch (e) {
            setMessage({ intent: Intent.DANGER, text: "LOGIN_ERROR" });
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
                        maxHeight: "100%",
                        margin: 0,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    <h1>Task Roulette</h1>

                    <InputGroup
                        disabled={false}
                        large={true}
                        placeholder={t("USERNAME_OR_EMAIL")}
                        type="text"
                        style={{ margin: "auto", marginBottom: "0.5em" }}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <InputGroup
                        disabled={false}
                        large={true}
                        placeholder={t("PASSWORD")}
                        type="password"
                        style={{ margin: "auto", marginBottom: "0.5em" }}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />

                    <Checkbox
                        checked={forever}
                        label={t("FOREVER")}
                        onChange={e => setForever(e.target.checked)}
                        style={{
                            float: "left",
                            margin: "0.5em"
                        }}
                    />

                    <Button
                        onClick={login}
                        fill={true}
                        intent={Intent.PRIMARY}
                    >{t("LOGIN")}</Button>

                    <Callout
                        intent={message.intent}
                        style={{ margin: "0.5em" }}
                    >
                        {t(message.text)}
                    </Callout>
                </Card>
            </article>
        </section >
    );
}

