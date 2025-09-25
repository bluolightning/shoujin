# Shoujin Web Extension

A browser extension for tracking and analyzing web browsing time and productivity. Built with WXT, React, TypeScript, and Mantine UI.

**Note**: This extension tracks your browsing activity locally - all browsing data is solely on your device.

## Features

- **Time Tracking**: Automatically tracks time spent on websites with session-based monitoring
- **Activity Dashboard**: Visual analytics with charts, heatmaps, and detailed breakdowns
- **Site Usage Analytics**: Track daily and hourly usage patterns across different websites
- **Productivity Tools**:
    - Pomodoro timer integration
    - Site blocking and limits
- **Data Management**: Import/export functionality with local storage
- **Cross-Browser Support**: Chrome, Firefox, and Edge compatibility

## Installation

To use Shoujin, install it from the releases or the official browser store:

- **Chrome**: (coming soon)
- **Firefox**: (coming soon)
- **Edge**: (coming soon)

Alternatively, for development and testing, see our [Contribution Guide](CONTRIBUTING.md).

## Usage

1. **Install the extension** and grant necessary permissions.
2. **Browse normally**—the extension automatically tracks time spent on websites.
3. **Open the dashboard** by clicking the extension icon to view your analytics and manage your data.

## 🔒 Permissions

The extension requires the following permissions to function correctly:

- `tabs`: Monitor tab changes and URL updates.
- `storage`: Persist tracking data locally on your device.
- `idle`: Detect when you are away from your computer.
- `activeTab`: Access the current tab's information for session tracking.
- `notifications`: Display productivity alerts, such as Pomodoro timers.

All data is stored locally on your device and is never sent to external servers. If enabled, domain names may be sent to external servers to enhance favicon reliability.

## 🤝 Contributing

We welcome contributions to Shoujin! If you're interested in fixing bugs, adding features, or improving the extension, please see our [**Contributing Guide**](CONTRIBUTING.md) for detailed instructions on how to get started.
