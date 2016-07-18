import React from 'react';
import {
  airportIconUrl,
  navaidIconUrl,
  fixIconUrl,
  airwayIconUrl,
  gpsIconUrl
} from './Map/Icons';

const iconMap = {
  airport: airportIconUrl,
  navaid: navaidIconUrl,
  fix: fixIconUrl
};


export default class NavItemIcon extends React.Component {
  title(navItem) {
    return [
      navItem.icao || '',
      navItem.name || '',
      navItem.identifier || '']
      .join(' ')
      .trim();
  }

  url(navItem) {
    return iconMap[navItem._type] ?
      iconMap[navItem._type](navItem)
    : gpsIconUrl(navItem);
  }

  render() {
    const { navItem, className } = this.props;

    return (
      <img
        className={'nav-item-icon ' + (className || '')}
        src={this.url(navItem)}
        alt={this.title(navItem)} />
    );
  }
}
