#FROM node:jod-trixie-slim
FROM node:jod-bullseye-slim
#FROM node:20

RUN apt update
RUN apt upgrade -y

RUN apt install -y nano iputils-ping curl borgbackup cron git sqlite3 wget unzip openjdk-11-jdk openjdk-17-jdk

# REMOVE THIS ****
RUN curl -fsSL https://opencode.ai/install | bash


# Install OpenJDK 15
# RUN cd /opt && \
#     wget https://github.com/adoptium/temurin15-binaries/releases/download/jdk-15.0.2%2B7/OpenJDK15U-jdk_x64_linux_hotspot_15.0.2_7.tar.gz && \
#     tar -xzf OpenJDK15U-jdk_x64_linux_hotspot_15.0.2_7.tar.gz && \
#     mv jdk-15.0.2+7 jdk-15 && \
#     rm OpenJDK15U-jdk_x64_linux_hotspot_15.0.2_7.tar.gz

# ENV JAVA_HOME=/opt/jdk-11
# ENV PATH="${JAVA_HOME}/bin:${PATH}"

# Install Android SDK
RUN mkdir -p /opt/android-sdk && cd /opt/android-sdk && \
    wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip && \
    unzip commandlinetools-linux-11076708_latest.zip && \
    mkdir -p cmdline-tools/latest && \
    mv cmdline-tools/bin cmdline-tools/lib cmdline-tools/NOTICE.txt cmdline-tools/source.properties cmdline-tools/latest/ 2>/dev/null || true && \
    rm commandlinetools-linux-11076708_latest.zip

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH="${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${PATH}"

# Accept licenses and install required SDK components (compatible with Gradle 6.9)
RUN yes | sdkmanager --licenses && \
    sdkmanager "platform-tools" "platforms;android-30" "build-tools;30.0.3"

# Install Gradle 6.9
RUN cd /opt && \
    wget https://services.gradle.org/distributions/gradle-6.9-bin.zip && \
    unzip gradle-6.9-bin.zip && \
    rm gradle-6.9-bin.zip

ENV PATH="/opt/gradle-6.9/bin:${PATH}"


# Install Gradle 7.3
# RUN cd /opt && \
#     wget https://services.gradle.org/distributions/gradle-7.3-bin.zip && \
#     unzip gradle-7.3-bin.zip && \
#     rm gradle-7.3-bin.zip
#
# ENV PATH="/opt/gradle-7.3/bin:${PATH}"



# ENV PATH="/home/scan/.local/bin:$PATH"


WORKDIR /root/ScanApp

COPY ./bashrc /root/.bashrc

RUN apt remove openjdk-17-jdk
RUN apt autoremove

#RUN npm
#
# RUN npm config set user 0
# RUN npm config set unsafe-perm true

#CMD ["bash", "start.sh"]


# docker build -t scan .
