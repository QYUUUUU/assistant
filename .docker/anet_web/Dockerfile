# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ~~~~ IMAGE POUR LA PREPROD/PRODUCTION ~~~~
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

FROM php:8.1.10-apache-bullseye

# ~~~~~~ CONF SITE ~~~~~~

ENV APACHE_DOCUMENT_ROOT /var/www/html/public

# ~~~~~~ CONF USER ~~~~~~

ENV UID_USER 1000
ENV GID_USER 1000

# ~~~~~~ CONF GENERAL ~~~~~~

ENV TIMEZONE Europe/Paris
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data
EXPOSE 80
WORKDIR /var/www/html/

# ~~~~~~ TIMEZONE ~~~~~~

RUN ln -snf /usr/share/zoneinfo/${TIMEZONE} /etc/localtime && \
    echo ${TIMEZONE} > /etc/timezone && \
    date

# ~~~~~~ USER SYSTEM ~~~~~~

RUN usermod -u ${UID_USER} ${APACHE_RUN_USER} && groupmod -g ${GID_USER} ${APACHE_RUN_GROUP}

# ~~~~~~ INSTALL PACKAGES ~~~~~~

RUN apt-get update && apt-get install -y libzip-dev zip unzip
RUN docker-php-ext-install zip

# ~~~~~~ CERTIF APACHE MODS APACHE ~~~~~~

RUN a2enmod rewrite headers expires && \
    sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf && \
    sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# ~~~~~~ INSTALL PHP EXTENSIONS MYSQLI / PDO MYSQL ~~~~~~

RUN apt-get install -y default-mysql-client && \
    docker-php-ext-install mysqli pdo pdo_mysql

# ~~~~~~ INSTALL PHP EXTENSIONS GD ~~~~~~

RUN apt-get install -y libpng-dev zlib1g-dev libwebp-dev libjpeg-dev
RUN docker-php-ext-configure gd --enable-gd --with-jpeg --with-webp
RUN docker-php-ext-install gd 

# ~~~~~~ INSTALL YARN ~~~~~~

RUN curl -sL https://deb.nodesource.com/setup_17.x | bash - && \
    curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -qq -y build-essential nodejs yarn && \
    mkdir /var/www/.cache && \
    chown www-data:www-data /var/www/.cache

# ~~~~~~ CONF PHP ~~~~~~

RUN echo "memory_limit = 128M\n\
    max_execution_time = 240\n\
    max_input_time = 300\n\
    max_input_vars = 6000\n\
    upload_max_filesize = 16M\n\
    post_max_size = 16M\n\
    display_errors = On\n\
    date.timezone = Europe/Paris" > /usr/local/etc/php/php.ini

# ~~~~~~ CONF MAIL ~~~~~~

RUN apt-get install -y exim4

RUN echo "dc_eximconfig_configtype='smarthost'\n\
    dc_local_interfaces='127.0.0.1 ; ::1'\n\
    dc_smarthost='smtp.alienor.net'\n\
    CFILEMODE='644'" > /etc/exim4/update-exim4.conf.conf

RUN service exim4 restart

# ~~~~~~ INSTALL OPCACHE ~~~~~~

RUN docker-php-ext-install opcache

# ~~~~~ INSTALL INTL ~~~~~~~

RUN apt-get install -y libicu-dev \
    && docker-php-ext-configure intl && docker-php-ext-install intl

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# ~~~~~ AJOUT DES OUTILS POUR LES DEVS  ~~~~
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# DEV ~~~~~~ INSTALL PACKAGES ~~~~~~

RUN apt-get install -y git vim sudo ssh

# DEV ~~~~~~ BASHRC ~~~~~~

RUN echo 'alias sf="sudo -HEu www-data php bin/console"\n\
    alias svi="sudo -HEu www-data vi"\n\
    alias svi="sudo -u www-data vi"\n\
    alias sw="sudo -HEu www-data"\n\
    alias sf="sudo -HEu www-data php bin/console"\n\
    alias amysql="mysql -hmariadb -uuserdb -ppassdb anetdb"\n\
    alias amysqldump="mysqldump -hmariadb -uuserdb -ppassdb anetdb"\n\' >> ~/.bashrc

# DEV ~~~~~~ INSTALL COMPOSER ~~~~~~

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer && \
    sudo -u www-data composer --version && \
    mkdir /var/www/.composer && \
    chown www-data:www-data /var/www/.composer
