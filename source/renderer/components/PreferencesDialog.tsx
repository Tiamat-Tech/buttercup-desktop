import * as React from "react";
import styled from "styled-components";
import { useState as useHookState } from "@hookstate/core";
import { Alignment, Button, ButtonGroup, Callout, Classes, Dialog, FormGroup, Intent, MenuItem, Slider, Switch } from "@blueprintjs/core";
import { Select } from "@blueprintjs/select";
import ms from "ms";
import prettyMS from "pretty-ms";
import { naiveClone } from "../../shared/library/clone";
import { SHOW_PREFERENCES, showPreferences as setShowPreferences } from "../state/preferences";
import { getPreferences, savePreferences } from "../services/preferences";
import { getAvailableLanguages } from "../services/i18n";
import { logErr, logInfo } from "../library/log";
import { showError, showSuccess } from "../services/notifications";
import { setBusy } from "../state/app";
import { PREFERENCES_DEFAULT } from "../../shared/symbols";
import { Language, Preferences, ThemeSource } from "../types";

const { useCallback, useEffect, useMemo, useState } = React;
const LanguageSelect = Select.ofType<Language>();
const ThemeSelect = Select.ofType<ThemeSource>();

const AUTO_CLEAR_CP_MAX = ms("30m") / 1000;
const LANG_AUTO_NAME = "Auto (OS)";
const LOCK_VAULTS_TIME_MAX = ms("1d") / 1000;
const PAGE_CONNECTIVITY = "connectivity";
const PAGE_GENERAL = "general";
const PAGE_SECURITY = "security";
const THEME_AUTO_NAME = "Auto (OS)";

const DialogFreeWidth = styled(Dialog)`
    width: 85%;
    max-width: 800px;
    min-width: 600px;
    height: 100%;
    min-height: 400px;
    max-height: 700px;
`;
const PreferencesContent = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
`;
const PreferencesMenu = styled(ButtonGroup)`
    width: 100%;
`;
const PreferencesSidebar = styled.div`
    width: 140px;
    flex: 0 0 auto;
    margin-right: 6px;
`;
const PageContent = styled.div`
    flex: 1 1 auto;
    box-sizing: border-box;
    padding-left: 16px;
    padding-right: 16px;
`;

export function PreferencesDialog() {
    const showPreferences = useHookState(SHOW_PREFERENCES);
    const [currentPage, setCurrentPage] = useState(PAGE_GENERAL);
    const [dirty, setDirty] = useState(false);
    const [preferences, _setPreferences] = useState<Preferences>(naiveClone(PREFERENCES_DEFAULT));
    const [languages, setLanguages] = useState<Array<Language>>([]);
    const setPreferences = useCallback((prefs: Preferences) => {
        _setPreferences(prefs);
        setDirty(true);
    }, [_setPreferences]);
    const selectedLanguageName = useMemo(() => {
        if (languages.length === 0 || !preferences.language) return LANG_AUTO_NAME;
        const lang = languages.find(lang => lang.slug === preferences.language);
        return lang && lang.name || LANG_AUTO_NAME;
    }, [preferences, languages]);
    const close = useCallback(() => {
        setShowPreferences(false);
        setCurrentPage(PAGE_GENERAL);
    }, []);
    const save = useCallback(() => {
        setBusy(true);
        savePreferences(preferences)
            .then(() => {
                showSuccess("Saved preferences");
                logInfo("Saved preferences");
                setDirty(false);
                setBusy(false);
                close();
            })
            .catch(err => {
                setBusy(false);
                showError("Failed saving preferences");
                logErr("Failed saving preferences", err);
            });
    }, [preferences]);
    useEffect(() => {
        getPreferences()
            .then(prefs => {
                _setPreferences(naiveClone(prefs));
                setDirty(false);
            })
            .catch(err => {
                showError("Failed loading preferences");
                logErr("Failed loading preferences", err);
                setShowPreferences(false);
            });
        getAvailableLanguages()
            .then(langs => {
                setLanguages([
                    {
                        name: LANG_AUTO_NAME,
                        slug: null
                    },
                    ...langs
                ]);
            })
            .catch(err => {
                showError("Failed loading languages");
                logErr("Failed loading languages", err);
                setShowPreferences(false);
            });
    }, [showPreferences.get()]);
    // Pages
    const pageGeneral = () => (
        <>
            <FormGroup label="Language">
                <LanguageSelect
                    filterable={false}
                    items={languages}
                    itemRenderer={(item: Language, { handleClick }) => (
                        <MenuItem
                            icon={item.slug === null ? "translate" : null}
                            key={item.name}
                            onClick={handleClick}
                            text={item.name}
                        />
                    )}
                    onItemSelect={(item: Language) => setPreferences({
                        ...naiveClone(preferences),
                        language: item.slug
                    })}
                >
                    <Button
                        text={selectedLanguageName}
                        rightIcon="double-caret-vertical"
                    />
                </LanguageSelect>
            </FormGroup>
            <FormGroup label="Theme">
                <ThemeSelect
                    filterable={false}
                    items={Object.values(ThemeSource)}
                    itemRenderer={(item: ThemeSource, { handleClick }) => (
                        <MenuItem
                            icon={item === ThemeSource.System ? "modal-filled" : null}
                            key={item || "none"}
                            onClick={handleClick}
                            text={item === ThemeSource.System ? THEME_AUTO_NAME : item === ThemeSource.Dark ? "Dark" : "Light"}
                        />
                    )}
                    onItemSelect={(item: ThemeSource) => setPreferences({
                        ...naiveClone(preferences),
                        uiTheme: item
                    })}
                >
                    <Button
                        text={preferences.uiTheme === ThemeSource.System ? THEME_AUTO_NAME : preferences.uiTheme === ThemeSource.Dark ? "Dark" : "Light"}
                        rightIcon="double-caret-vertical"
                    />
                </ThemeSelect>
            </FormGroup>
        </>
    );
    const pageSecurity = () => (
        <>
            <FormGroup label="Automatically clear clipboard">
                <Slider
                    labelRenderer={value => value > 0 ? prettyMS(value * 1000) : "Off"}
                    labelStepSize={60 * 5}
                    max={AUTO_CLEAR_CP_MAX}
                    min={0}
                    onChange={value => setPreferences({
                        ...naiveClone(preferences),
                        autoClearClipboard: value === 0 ? false : value
                    })}
                    stepSize={30}
                    value={preferences.autoClearClipboard === false ? 0 : preferences.autoClearClipboard}
                />
            </FormGroup>
            <FormGroup label="Lock vaults after time">
                <Slider
                    labelRenderer={value => value > 0 ? prettyMS(value * 1000) : "Off"}
                    labelStepSize={ms("1h") / 1000}
                    max={LOCK_VAULTS_TIME_MAX}
                    min={0}
                    onChange={value => setPreferences({
                        ...naiveClone(preferences),
                        lockVaultsAfterTime: value === 0 ? false : value
                    })}
                    stepSize={60}
                    value={preferences.lockVaultsAfterTime === false ? 0 : preferences.lockVaultsAfterTime}
                />
                <p>Automatically lock vaults after some period of inactivity.</p>
            </FormGroup>
            <FormGroup label="Lock vaults if vault window closed">
                <Switch
                    checked={preferences.lockVaultsOnWindowClose}
                    label="Lock on close"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setPreferences({
                        ...naiveClone(preferences),
                        lockVaultsOnWindowClose: evt.target.checked
                    })}
                />
            </FormGroup>
        </>
    );
    const pageConnectivity = () => (
        <>
            <FormGroup label="Secure file host">
                <Callout icon="info-sign">
                    The secure file host allows the <strong>Buttercup Browser Extension</strong> to connect to local vaults on this PC via this application.
                </Callout>
                <Switch
                    checked={preferences.fileHostEnabled}
                    label="Enable secure file host"
                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => setPreferences({
                        ...naiveClone(preferences),
                        fileHostEnabled: evt.target.checked
                    })}
                />
            </FormGroup>
        </>
    );
    // Render
    return (
        <DialogFreeWidth isOpen={showPreferences.get()} onClose={close}>
            <div className={Classes.DIALOG_HEADER}>Preferences</div>
            <div className={Classes.DIALOG_BODY}>
                {showPreferences.get() && (
                    <PreferencesContent>
                        <PreferencesSidebar>
                            <PreferencesMenu
                                alignText={Alignment.LEFT}
                                vertical
                            >
                                <Button
                                    active={currentPage === PAGE_GENERAL}
                                    icon="modal"
                                    onClick={() => setCurrentPage(PAGE_GENERAL)}
                                    text="General"
                                />
                                <Button
                                    active={currentPage === PAGE_SECURITY}
                                    icon="shield"
                                    onClick={() => setCurrentPage(PAGE_SECURITY)}
                                    text="Security"
                                />
                                <Button
                                    active={currentPage === PAGE_CONNECTIVITY}
                                    icon="offline"
                                    onClick={() => setCurrentPage(PAGE_CONNECTIVITY)}
                                    text="Connectivity"
                                />
                                <Button
                                    disabled
                                    icon="eye-off"
                                    text="Privacy"
                                />
                                <Button
                                    disabled
                                    icon="lab-test"
                                    text="Debug"
                                />
                            </PreferencesMenu>
                        </PreferencesSidebar>
                        <PageContent>
                            {currentPage === PAGE_GENERAL && pageGeneral()}
                            {currentPage === PAGE_SECURITY && pageSecurity()}
                            {currentPage === PAGE_CONNECTIVITY && pageConnectivity()}
                        </PageContent>
                    </PreferencesContent>
                )}
            </div>
            <div className={Classes.DIALOG_FOOTER}>
                <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <Button
                        disabled={!dirty}
                        intent={Intent.PRIMARY}
                        onClick={() => save()}
                        title="Save changes"
                    >
                        Save
                    </Button>
                    <Button
                        onClick={close}
                        title="Cancel Preferences update"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </DialogFreeWidth>
    );
}
