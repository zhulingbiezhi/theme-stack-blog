# The Best OctoPrint Plugins And How To Install Them

**September 10, 2021** · 16 min read · By Neil Hailey

This article was updated on August 12, 2022

[OctoPrint](https://octoprint.org/) is a web interface dedicated to making 3D printing easier by allowing you to control and monitor the process. The software allows you to access and control virtually any parameter on your printer.

Moreover, in a heart-warming, traditional internet fashion, it's open source.

There is a vast database of plugins developed by the 3D printing community that make your experience with [OctoPrint](https://octoprint.org/) even better, and here we list and explain the most popular ones.

## Table of Contents
- [Plugin #1: Obico (successor of The Spaghetti Detective)](#plugin-1-obico--successor-of-the-spaghetti-detective)
- [Plugin #2: Bed Level Visualizer](#plugin-2-bed-level-visualizer)
- [Plugin #3: OctoPrint-PrintTimeGenius](#plugin-3-octoprint-printtimegenius)
- [Plugin #4: Octolapse](#plugin-4-octolapse)
- [Plugin #5: DisplayLayerProgress](#plugin-5-displaylayerprogress)
- [Plugin #6: Themeify](#plugin-6-themeify)
- [Plugin #7: Firmware Updater](#plugin-7-firmware-updater)
- [Plugin #8: Navbar Temp](#plugin-8-navbar-temp)
- [Plugin #9: OctoPrint-Dashboard](#plugin-9-octoprint-dashboard)
- [Plugin #10: Creality 2x temperature reporting fix](#plugin-10-creality-2x-temperature-reporting-fix)
- [Plugin #11: HeaterTimeout](#plugin-11-heatertimeout)
- [Plugin #12: GcodeEditor](#plugin-12-gcodeeditor)
- [Plugin #13: Touch UI](#plugin-13-touch-ui)
- [Plugin #14: Arc Welder](#plugin-14-arc-welder)
- [Plugin #15: OctoPrint-BLTouch](#plugin-15-octoprint-bltouch)
- [Plugin #16: Simple Emergency Stop](#plugin-16-simple-emergency-stop)
- [Plugin #17: OctoPrint-Display-ETA](#plugin-17-octoprint-display-eta)
- [Plugin #18: OctoPrint-TPLinkSmartplug](#plugin-18-octoprint-tplinksmartplug)
- [Plugin #19: OctoPrint-CustomBackground](#plugin-19-octoprint-custombackground)
- [Plugin #20: Exclude Region](#plugin-20-exclude-region)
- [Plugin #21: OctoPrint-Enclosure](#plugin-21-octoprint-enclosure)
- [How to get OctoPrint plugins?](#how-to-get-octoprint-plugins)

## Plugin #1: Obico (successor of The Spaghetti Detective)

Obico, which has replaced The Spaghetti Detective, is an all in one plugin that gives you the ability to monitor and control your 3D printer from anywhere with internet connection. Using Artificial Intelligence, and a webcam or Raspberry Pi camera, it determines whether there's something wrong going on with your print in real time and can send you a notification or intervene by itself preventing equipment damage and wasted filament.

[Check out Obico in action](https://www.youtube.com/embed/znI9_Vs6X9c). Pay attention to the gauge at the bottom. Video from [the official Obico youtube account](https://www.youtube.com/channel/UCbAJcR6t5lrdZ1JXjPPRjGA).

If it sounds a bit too futuristic, that's what I thought at first too! While Obico is still learning, and she does make mistakes, she has already watched over 45,000,000 hours of prints, caught over 575,000 failures and saved over 10,000 spools of filament from being wasted. Moreover, this plugin gives you the ability to access your webcam from any device, as well as save time-lapses of your prints. A dedicated smartphone app works both on iOS and Android devices.

![Obico remote control](https://www.obico.io/docs/assets/images/obico-for-octoprint-the-spaghetti-detective-plugin.png)

However, this plugin has one "but". It's open source, but to obtain additional features like e-mail support customization of the AI model you have to get a paid subscription from [the official Obico website](https://www.obico.io/).

### Recommended for:
- Recognizing print fails in real time.
- Getting live feed of the printing process on your phone.

### Created by:
[The Obico team](https://plugins.octoprint.org/by_author/#the-obico-team)

[GitHub page](https://github.com/TheSpaghettiDetective/OctoPrint-Obico)

[Project Homepage](http://obico.io/)

## Plugin #2: Bed Level Visualizer

This plugin creates a 3D visualization of your print bed's leveling based on the data from your bed leveling sensor. It helps you see exactly where your bed is uneven and by how much, making it easier to adjust your bed leveling screws.

![Bed Level Visualizer](https://www.obico.io/docs/assets/images/octoprint-bed-level-visualizer-plugin.png)

### Recommended for:
- Visualizing bed leveling data
- Identifying uneven areas on your print bed

### Created by:
[jneilliii](https://plugins.octoprint.org/by_author/#jneilliii)

[GitHub page](https://github.com/jneilliii/OctoPrint-BedLevelVisualizer)

## Plugin #3: OctoPrint-PrintTimeGenius

This plugin provides more accurate print time estimates by analyzing your G-code and considering your printer's acceleration and jerk settings. It's particularly useful for complex prints where standard time estimates can be significantly off.

### Recommended for:
- Getting accurate print time estimates
- Planning print schedules

### Created by:
[eyal0](https://plugins.octoprint.org/by_author/#eyal0)

[GitHub page](https://github.com/eyal0/OctoPrint-PrintTimeGenius)

## Plugin #4: Octolapse

Octolapse creates stunning time-lapse videos of your 3D prints by moving the print head to a specific position before taking each frame. This results in smooth, professional-looking time-lapses.

![Octolapse example](https://www.obico.io/docs/assets/images/octolapse-plugin.png)

### Recommended for:
- Creating professional 3D printing time-lapses
- Showcasing your prints

### Created by:
[FormerLurker](https://plugins.octoprint.org/by_author/#FormerLurker)

[GitHub page](https://github.com/FormerLurker/Octolapse)

## Plugin #5: DisplayLayerProgress

This plugin shows the progress of your print layer by layer, giving you a better understanding of how much time is left for each section of your print.

### Recommended for:
- Monitoring layer-by-layer progress
- Understanding print structure

### Created by:
[marhi](https://plugins.octoprint.org/by_author/#marhi)

[GitHub page](https://github.com/marhi/OctoPrint-DisplayLayerProgress)

## Plugin #6: Themeify

Themeify allows you to customize the look of your OctoPrint interface with different themes and color schemes. It's great for personalizing your 3D printing experience.

![Themeify example](https://www.obico.io/docs/assets/images/themeify-plugin.png)

### Recommended for:
- Customizing OctoPrint interface
- Creating personalized themes

### Created by:
[cp2004](https://plugins.octoprint.org/by_author/#cp2004)

[GitHub page](https://github.com/cp2004/OctoPrint-Themeify)

## Plugin #7: Firmware Updater

This plugin simplifies the process of updating your 3D printer's firmware directly from OctoPrint. It supports multiple firmware types and makes firmware updates less intimidating.

### Recommended for:
- Updating printer firmware
- Managing firmware versions

### Created by:
[foosel](https://plugins.octoprint.org/by_author/#foosel)

[GitHub page](https://github.com/foosel/OctoPrint-FirmwareUpdater)

## Plugin #8: Navbar Temp

Navbar Temp adds temperature monitoring to your OctoPrint navigation bar, giving you quick access to important temperature information.

### Recommended for:
- Quick temperature monitoring
- At-a-glance status updates

### Created by:
[jneilliii](https://plugins.octoprint.org/by_author/#jneilliii)

[GitHub page](https://github.com/jneilliii/OctoPrint-NavbarTemp)

## Plugin #9: OctoPrint-Dashboard

This plugin provides a comprehensive dashboard view of your 3D printer's status, including temperature graphs, print progress, and control buttons.

![Dashboard example](https://www.obico.io/docs/assets/images/dashboard-plugin.png)

### Recommended for:
- Comprehensive printer monitoring
- Centralized control interface

### Created by:
[StefanCohen](https://plugins.octoprint.org/by_author/#StefanCohen)

[GitHub page](https://github.com/StefanCohen/OctoPrint-Dashboard)

## Plugin #10: Creality 2x temperature reporting fix

This plugin fixes the temperature reporting issue on some Creality printers that report temperatures twice as high as they actually are.

### Recommended for:
- Creality printer owners
- Fixing temperature reporting issues

### Created by:
[cp2004](https://plugins.octoprint.org/by_author/#cp2004)

[GitHub page](https://github.com/cp2004/OctoPrint-Creality2xTempFix)

## Plugin #11: HeaterTimeout

HeaterTimeout automatically turns off your printer's heaters after a specified period of inactivity, helping to prevent accidents and save energy.

### Recommended for:
- Safety and energy efficiency
- Preventing overheating

### Created by:
[markwal](https://plugins.octoprint.org/by_author/#markwal)

[GitHub page](https://github.com/markwal/OctoPrint-HeaterTimeout)

## Plugin #12: GcodeEditor

This plugin provides a built-in G-code editor within OctoPrint, allowing you to view and edit G-code files directly in your browser.

### Recommended for:
- Editing G-code files
- Quick modifications before printing

### Created by:
[cp2004](https://plugins.octoprint.org/by_author/#cp2004)

[GitHub page](https://github.com/cp2004/OctoPrint-GcodeEditor)

## Plugin #13: Touch UI

Touch UI transforms OctoPrint's interface into a touch-friendly version, making it easier to use on tablets and touchscreen devices.

![Touch UI example](https://www.obico.io/docs/assets/images/touch-ui-plugin.png)

### Recommended for:
- Touchscreen devices
- Mobile-friendly interface

### Created by:
[BillyBlaze](https://plugins.octoprint.org/by_author/#BillyBlaze)

[GitHub page](https://github.com/BillyBlaze/OctoPrint-TouchUI)

## Plugin #14: Arc Welder

Arc Welder optimizes G-code by converting small linear movements into arcs, reducing file size and improving print quality.

### Recommended for:
- Optimizing G-code
- Improving print quality

### Created by:
[FormerLurker](https://plugins.octoprint.org/by_author/#FormerLurker)

[GitHub page](https://github.com/FormerLurker/OctoPrint-ArcWelder)

## Plugin #15: OctoPrint-BLTouch

This plugin provides enhanced support for BLTouch auto-leveling sensors, making bed leveling easier and more accurate.

### Recommended for:
- BLTouch users
- Improved auto-leveling

### Created by:
[jneilliii](https://plugins.octoprint.org/by_author/#jneilliii)

[GitHub page](https://github.com/jneilliii/OctoPrint-BLTouch)

## Plugin #16: Simple Emergency Stop

This plugin adds a large, easy-to-access emergency stop button to your OctoPrint interface, providing quick access in case of emergencies.

### Recommended for:
- Safety and quick response
- Emergency situations

### Created by:
[cp2004](https://plugins.octoprint.org/by_author/#cp2004)

[GitHub page](https://github.com/cp2004/OctoPrint-SimpleEmergencyStop)

## Plugin #17: OctoPrint-Display-ETA

This plugin adds an estimated time of arrival (ETA) display to your OctoPrint interface, showing when your print will be finished.

### Recommended for:
- Tracking print completion time
- Planning your schedule

### Created by:
[OllisGit](https://plugins.octoprint.org/by_author/#OllisGit)

[GitHub page](https://github.com/OllisGit/OctoPrint-Display-ETA)

## Plugin #18: OctoPrint-TPLinkSmartplug

This plugin allows you to control TP-Link smart plugs directly from OctoPrint, enabling automatic power control for your 3D printer.

### Recommended for:
- Smart plug integration
- Automated power management

### Created by:
[jneilliii](https://plugins.octoprint.org/by_author/#jneilliii)

[GitHub page](https://github.com/jneilliii/OctoPrint-TPLinkSmartplug)

## Plugin #19: OctoPrint-CustomBackground

This plugin lets you customize the background of your OctoPrint interface with your own images or colors.

### Recommended for:
- Personalizing OctoPrint interface
- Adding custom backgrounds

### Created by:
[cp2004](https://plugins.octoprint.org/by_author/#cp2004)

[GitHub page](https://github.com/cp2004/OctoPrint-CustomBackground)

## Plugin #20: Exclude Region

This plugin allows you to exclude specific regions of your print bed from being used. It's useful when you have a damaged area on your print bed or want to avoid certain spots.

### Recommended for:
- Working around damaged print bed areas
- Optimizing print bed usage

### Created by:
[cp2004](https://plugins.octoprint.org/by_author/#cp2004)

[GitHub page](https://github.com/cp2004/OctoPrint-ExcludeRegion)

## Plugin #21: OctoPrint-Enclosure

This plugin allows you to monitor and control your 3D printer enclosure environment. It supports temperature and humidity sensors, and can control fans and lights inside the enclosure.

### Recommended for:
- Monitoring enclosure temperature and humidity
- Controlling enclosure environment

### Created by:
[foosel](https://plugins.octoprint.org/by_author/#foosel)

[GitHub page](https://github.com/foosel/OctoPrint-Enclosure)

## How to get OctoPrint plugins?

To get the plugins, simply open the links provided, or browse [OctoPrint plugin repository](https://plugins.octoprint.org) by yourself.

The installation process can be done via Plugin Manager built into OctoPrint or with a command line.

Plugin Manager gives 3 options to install a plugin: from the listed plugin repository (using search bar), from URL or from an archive stored in your hardware.

![install plugin octoprint](https://plugins.octoprint.org/assets/img/help/install_plugin_from_repo.png)

To install a plugin via command line, paste it into the command line of the host you installed OctoPrint on.

[This wonderful video](https://www.youtube.com/embed/HBd0olxI-No) by [Thomas Sanladerer](https://www.youtube.com/channel/UCb8Rde3uRL1ohROUVg46h1A) can help you get through the process.

For more information see [OctoPrint Help Page](https://plugins.octoprint.org/help/installation/).
