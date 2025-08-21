import React from 'react';
import {StorageManager} from '@/utils/storage';
import {Button, Text} from '@mantine/core';
import {modals} from '@mantine/modals';
import {notifications} from '@mantine/notifications';

export default function DataSettings() {
    const handleDeleteAllData = async () => {
        try {
            console.log('Deleting all data...');
            await StorageManager.clearAllData();
            notifications.show({
                title: 'Data Deletion Successful',
                message: 'Your data has been successfully deleted.',
                color: 'green',
                withCloseButton: false,
                id: 'delete-data-success',
                onClick: () => {
                    notifications.hide('delete-data-success');
                },
            });
        } catch (error) {
            console.error('Error deleting data:', error);
            notifications.show({
                title: 'Data Deletion Failed',
                message: 'Error while deleting data.',
                color: 'red',
                withCloseButton: false,
                id: 'delete-data-error',
                onClick: () => {
                    notifications.hide('delete-data-error');
                },
            });
        }
    };

    const handleBackup = async () => {
        try {
            const data = await StorageManager.getAllStoredData();
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
            a.download = `shoujin_backup_${date}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            notifications.show({
                title: 'Backup Successful',
                message: 'Your data has been backed up successfully.',
                color: 'green',
                withCloseButton: false,
                id: 'backup-success',
                onClick: () => {
                    notifications.hide('backup-success');
                },
            });
        } catch (error) {
            console.error('Error backing up data:', error);
            notifications.show({
                title: 'Backup Failed',
                message: 'Error while backing up data.',
                color: 'red',
                withCloseButton: false,
                id: 'backup-error',
                onClick: () => {
                    notifications.hide('backup-error');
                },
            });
        }
    };

    const handleImport = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = async (event) => {
            const file = (event.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data: PageTimeEntry[] = JSON.parse(e.target?.result as string);
                    await StorageManager.importData(data);
                    notifications.show({
                        title: 'Import Successful',
                        message: 'Your data has been imported successfully.',
                        color: 'green',
                        withCloseButton: false,
                        id: 'import-success',
                        onClick: () => {
                            notifications.hide('import-success');
                        },
                    });
                } catch (error) {
                    notifications.show({
                        title: 'Import Aborted',
                        message: 'Error while importing data.',
                        color: 'red',
                        withCloseButton: false,
                        id: 'import-error',
                        onClick: () => {
                            notifications.hide('import-error');
                        },
                    });
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    // Opens a confirmation for data deletion
    const openModal = () =>
        modals.openConfirmModal({
            title: 'Please confirm your action',
            children: (
                <Text size='sm'>
                    Are you sure you want to delete all data? This action cannot be undone.
                </Text>
            ),
            labels: {confirm: 'Delete All Data', cancel: 'Cancel'},
            confirmProps: {color: 'red'},
            cancelProps: {color: 'blue', variant: 'outline'},
            onCancel: () => console.log('Data deletion cancelled'),
            onConfirm: () => {
                handleDeleteAllData();
                console.log('All data deleted');
            },
        });

    return (
        <>
            <h1>
                Hello from the <strong>DataSettings</strong> page of the app!
            </h1>
            <Button
                variant='gradient'
                gradient={{from: 'red', to: 'pink', deg: 90}}
                onClick={openModal}>
                Delete All Data
            </Button>

            <Button
                variant='gradient'
                gradient={{from: 'blue', to: 'cyan', deg: 90}}
                onClick={handleBackup}>
                Backup Data
            </Button>

            <Button
                variant='gradient'
                gradient={{from: 'green', to: 'teal', deg: 90}}
                onClick={handleImport}>
                Import Data
            </Button>
        </>
    );
}
