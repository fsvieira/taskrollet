import React, { useState } from "react";
import { useTranslation } from 'react-i18next';

import {
    Button,
    Card,
    Elevation,
    InputGroup,
    Checkbox
} from "@blueprintjs/core";

const API_URL_LOGIN = process.env.REACT_JSONAPI_URL + "/login";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [forever, setForever] = useState(false);

    const { t } = useTranslation();

    const login = async () => {
        // Fetch emdpoint
        try {
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
            }
            else if (data.status === 403) {
                console.log("TODO: Forbiden");
            }
            else {
                const { token, user } = await data.json();
                console.log("DATA => ", token, user);
            }

        }
        catch (e) {
            console.log(e);
        }
    };

    return (
        <section>
            <article>
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
                        placeholder={t("Username or Email")}
                        type="text"
                        style={{ margin: "0.5em" }}
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />

                    <InputGroup
                        disabled={false}
                        large={true}
                        placeholder={t("Password")}
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
                </Card>
            </article>
        </section>
    );
}

